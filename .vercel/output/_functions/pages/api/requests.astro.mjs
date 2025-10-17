import { g as getRequestsCollection } from '../../chunks/mongodb_DLpt4MAH.mjs';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";
    const product = searchParams.get("product") || "";
    const adminApproval = searchParams.get("adminApproval") || "";
    const collection = await getRequestsCollection();
    const filter = {};
    const andConditions = [];
    if (search) {
      andConditions.push({
        $or: [
          { devId: { $regex: search, $options: "i" } },
          { requesterEmail: { $regex: search, $options: "i" } },
          { product: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } }
        ]
      });
    }
    if (country) {
      andConditions.push({ country: { $regex: country, $options: "i" } });
    }
    if (product) {
      andConditions.push({ product: { $regex: product, $options: "i" } });
    }
    if (adminApproval) {
      const adminLower = adminApproval.toLowerCase();
      if (adminLower === "pendiente" || adminLower === "waiting for approval" || adminLower === "waiting integration") {
        andConditions.push({
          $or: [
            { adminApproval: { $regex: "pendiente", $options: "i" } },
            { adminApproval: { $regex: "pending", $options: "i" } },
            { adminApproval: { $regex: "waiting for approval", $options: "i" } },
            { adminApproval: { $regex: "waiting integration", $options: "i" } },
            { adminApproval: null },
            { adminApproval: { $exists: false } },
            { adminApproval: "undefined" }
          ]
        });
      } else {
        andConditions.push({ adminApproval: { $regex: adminApproval, $options: "i" } });
      }
    }
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        Object.assign(filter, andConditions[0]);
      } else {
        filter.$and = andConditions;
      }
    }
    const total = await collection.countDocuments(filter);
    const requests = await collection.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
    const transformedRequests = requests.map((request) => {
      let requestType = "New";
      if (request.type) {
        if (request.type === "modify") {
          requestType = "Modify";
        } else if (request.type === "saved") {
          requestType = "Saved";
        } else {
          requestType = "New";
        }
      } else {
        const modifyValue = request.Modify ?? request.modify ?? false;
        const transformedModify = modifyValue === true || modifyValue === "true" || modifyValue > 0;
        requestType = transformedModify ? "Modify" : "New";
      }
      let adminApproval2 = request.adminApproval || "Waiting for approval";
      if (adminApproval2 === "PENDING" || adminApproval2 === "Pending" || adminApproval2 === "undefined" || adminApproval2 === void 0 || adminApproval2 === "Pendiente") {
        adminApproval2 = "Waiting for approval";
      }
      return {
        devId: request.devId || "N/A",
        createdAt: request.createdAt || /* @__PURE__ */ new Date(),
        requesterName: request.requesterName || "N/A",
        requesterEmail: request.requesterEmail || request.requesterName || "N/A",
        adminApproval: adminApproval2,
        country: request.country || "N/A",
        product: request.product || "N/A",
        planType: request.planType || "N/A",
        jiraTaskUrl: request.jiraTaskUrl || "",
        jiraTaskKey: request.jiraTaskKey || "",
        type: requestType,
        Modify: requestType === "Modify",
        // Mantener compatibilidad
        _id: request._id.toString()
      };
    });
    return new Response(JSON.stringify({
      success: true,
      data: transformedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Error al obtener las solicitudes"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
