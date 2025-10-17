import { c as connectToDatabase } from '../../chunks/mongodb_DLpt4MAH.mjs';
import { u as updateJiraTaskStatus, a as addCommentToJiraTask } from '../../chunks/jira_D_fF5vVd.mjs';
import { ObjectId } from 'mongodb';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("API received request body:", body);
    const { requestId, newStatus, token } = body;
    console.log("Extracted values:", { token: token ? "[PRESENT]" : "[MISSING]", requestId, newStatus });
    const MAXI_TOKEN = process.env.MAXI_APPROVAL_TOKEN || "maxi-secret-token-2024";
    const ADMIN_TOKEN = process.env.ADMIN_APPROVAL_TOKEN || "4444";
    const isMaxiToken = token === MAXI_TOKEN;
    const isAdminToken = token === ADMIN_TOKEN;
    if (!isMaxiToken && !isAdminToken) {
      console.log("Token validation failed");
      return new Response(JSON.stringify({
        success: false,
        error: "Token de autenticación inválido"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Token validation passed");
    if (!requestId || !newStatus) {
      console.log("Missing required parameters:", { requestId: !!requestId, newStatus: !!newStatus });
      return new Response(JSON.stringify({
        success: false,
        error: "requestId y newStatus son requeridos"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Required parameters validation passed");
    const validStatuses = ["Aprobado", "Pendiente", "Rechazado", "En Revisión", "Waiting for approval", "Waiting for integration", "Waiting integration", "DECLINED"];
    if (!validStatuses.includes(newStatus)) {
      return new Response(JSON.stringify({
        success: false,
        error: "Estado inválido. Debe ser: Aprobado, Pendiente, Rechazado o En Revisión"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Connecting to database...");
    const { db } = await connectToDatabase();
    const collection = db.collection("requests");
    console.log("Database connection established");
    console.log("Validating ObjectId:", requestId);
    if (!ObjectId.isValid(requestId)) {
      console.log("Invalid ObjectId format");
      return new Response(JSON.stringify({
        success: false,
        error: "ID de solicitud inválido"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingRequest = await collection.findOne({ _id: new ObjectId(requestId) });
    if (!existingRequest) {
      console.log("No document found with ID:", requestId);
      return new Response(JSON.stringify({
        success: false,
        error: "Solicitud no encontrada"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (isAdminToken) {
      const currentAdminStatus = (existingRequest.adminApproval || "").toString();
      const currentLower = currentAdminStatus.toLowerCase();
      const newLower = newStatus.toLowerCase();
      const isCurrentApproved = currentLower.includes("aprobado") || currentLower.includes("approved");
      const isCurrentDeclined = currentLower.includes("rechazado") || currentLower.includes("declined") || currentLower.includes("rejected") || currentLower.includes("refused");
      const isCurrentWaitingIntegration = currentLower.includes("waiting for integration") || currentLower.includes("waiting integration") || currentLower.includes("pendiente");
      const isNewApproved = newLower.includes("aprobado") || newLower.includes("approved");
      const isNewDeclined = newLower.includes("rechazado") || newLower.includes("declined") || newLower.includes("rejected") || newLower.includes("refused");
      const isNewWaitingIntegration = newLower.includes("waiting for integration") || newLower.includes("waiting integration") || newLower.includes("pendiente");
      if (isCurrentApproved && isNewWaitingIntegration) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Transición no permitida: no se puede cambiar de "APPROVED" a "WAITING FOR INTEGRATION"'
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (isCurrentWaitingIntegration && isNewDeclined) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Transición no permitida: no se puede cambiar de "WAITING FOR INTEGRATION" a "DECLINED"'
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (isCurrentApproved && isNewDeclined || isCurrentDeclined && isNewApproved) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Transición no permitida: no se puede cambiar de "APPROVED" a "DECLINED" ni de "DECLINED" a "APPROVED"'
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    console.log("Attempting to update document with ID:", requestId);
    const updateField = isAdminToken ? "adminApproval" : "maxiApproval";
    const updatedBy = isAdminToken ? "Admin" : "Maxi";
    const result = await collection.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          [updateField]: newStatus,
          updatedAt: /* @__PURE__ */ new Date(),
          updatedBy
        }
      }
    );
    console.log("Update result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged
    });
    if (result.matchedCount === 0) {
      console.log("No document found with ID:", requestId);
      return new Response(JSON.stringify({
        success: false,
        error: "No se pudo actualizar la solicitud"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    let jiraCommentSent = false;
    let jiraStatusUpdated = false;
    if (isAdminToken && existingRequest.jiraTaskKey) {
      console.log("Processing Jira updates for task:", existingRequest.jiraTaskKey);
      if (newStatus === "Aprobado") {
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, "Approved");
        const commentText = "Automatically generated message: The status of this task is: APPROVED";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
      } else if (newStatus === "Waiting for approval") {
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, "Waiting for approval");
        const commentText = "Automatically generated message: The status of this task is: WAITING FOR APPROVAL.";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
      } else if (newStatus === "Pendiente" || newStatus === "Waiting for integration" || newStatus === "Waiting integration") {
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, "Waiting for integration");
        if (!jiraStatusUpdated) {
          console.warn('Primary transition to "Waiting for integration" failed, trying "Waiting integration" alias');
          jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, "Waiting integration");
        }
        const commentText = "Automatically generated message: The status of this task is: WAITING FOR INTEGRATION.";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
      } else if (newStatus === "Rechazado" || newStatus === "DECLINED") {
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, "Declined");
        const commentText = "Automatically generated message: The status of this request is: DECLINED.";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
      }
      if (jiraStatusUpdated) {
        console.log("Jira status updated successfully");
      } else {
        console.warn(`Failed to update Jira status for task ${existingRequest.jiraTaskKey} to ${newStatus}`);
      }
      if (jiraCommentSent) {
        console.log("Jira comment sent successfully");
      } else {
        console.warn("Failed to send Jira comment");
      }
    }
    return new Response(JSON.stringify({
      success: true,
      jiraStatusUpdated,
      jiraCommentSent
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error en API update-approval:", error);
    return new Response(JSON.stringify({ success: false, error: "Ocurrió un error al procesar la solicitud" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
