import { c as connectToDatabase } from '../../chunks/mongodb_DLpt4MAH.mjs';
import { ObjectId } from 'mongodb';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("API received request body:", body);
    const { requestId, newStatus, token } = body;
    console.log("Extracted values:", { token: token ? "[PRESENT]" : "[MISSING]", requestId, newStatus });
    const ADMIN_TOKEN = process.env.ADMIN_APPROVAL_TOKEN || "admin-secret-token-2024";
    if (token !== ADMIN_TOKEN) {
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
    const validStatuses = ["Aprobado", "Pendiente", "Rechazado", "En Revisión"];
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
    console.log("Attempting to update document with ID:", requestId);
    const result = await collection.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          adminApproval: newStatus,
          updatedAt: /* @__PURE__ */ new Date(),
          updatedBy: "Admin"
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
        error: "Solicitud no encontrada"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Update successful");
    return new Response(JSON.stringify({
      success: true,
      message: "Estado actualizado correctamente"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error updating approval status:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error interno del servidor"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
