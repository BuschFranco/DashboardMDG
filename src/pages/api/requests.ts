import type { APIRoute } from 'astro';
import { getRequestsCollection, type RequestDocument } from '../../lib/mongodb';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URL(url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const product = searchParams.get('product') || '';
    const adminApproval = searchParams.get('adminApproval') || '';
    
    const collection = await getRequestsCollection();
    
    // Build filter object
    const filter: any = {};
    const andConditions: any[] = [];
    
    if (search) {
      andConditions.push({
        $or: [
          { devId: { $regex: search, $options: 'i' } },
          { requesterEmail: { $regex: search, $options: 'i' } },
          { product: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    if (country) {
      andConditions.push({ country: { $regex: country, $options: 'i' } });
    }
    
    if (product) {
      andConditions.push({ product: { $regex: product, $options: 'i' } });
    }
    
    if (adminApproval) {
      if (adminApproval.toLowerCase() === 'pendiente') {
        // Para "Pendiente", buscar múltiples variaciones incluyendo valores null/undefined
        andConditions.push({
          $or: [
            { adminApproval: { $regex: 'pendiente', $options: 'i' } },
            { adminApproval: { $regex: 'pending', $options: 'i' } },
            { adminApproval: null },
            { adminApproval: { $exists: false } },
            { adminApproval: 'undefined' }
          ]
        });
      } else {
        andConditions.push({ adminApproval: { $regex: adminApproval, $options: 'i' } });
      }
    }
    
    // Combine all conditions with $and if there are multiple conditions
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        Object.assign(filter, andConditions[0]);
      } else {
        filter.$and = andConditions;
      }
    }
    
    // Get total count for pagination
    const total = await collection.countDocuments(filter);
    
    // Get paginated results
    const requests = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();
    
    // Transform the data to match our interface
    const transformedRequests = requests.map((request: any) => {
      // Usar el campo 'type' de la base de datos, con fallback a lógica legacy
      let requestType = 'New'; // Default
      
      if (request.type) {
         // Si existe el campo 'type', usarlo directamente
         if (request.type === 'modify') {
           requestType = 'Modify';
         } else if (request.type === 'saved') {
           requestType = 'Saved';
         } else {
           requestType = 'New';
         }
       } else {
        // Fallback a lógica legacy con campos Modify/modify
        const modifyValue = request.Modify ?? request.modify ?? false;
        const transformedModify = modifyValue === true || modifyValue === 'true' || modifyValue > 0;
        requestType = transformedModify ? 'Modify' : 'New';
      }
      
      // Normalizar el estado de adminApproval
      let adminApproval = request.adminApproval || 'Pendiente';
      if (adminApproval === 'PENDING' || adminApproval === 'Pending' || adminApproval === 'undefined' || adminApproval === undefined) {
        adminApproval = 'Pendiente';
      }
      
      return {
        devId: request.devId || 'N/A',
        createdAt: request.createdAt || new Date(),
        requesterName: request.requesterName || 'N/A',
        requesterEmail: request.requesterEmail || request.requesterName || 'N/A',
        adminApproval: adminApproval,
        country: request.country || 'N/A',
        product: request.product || 'N/A',
        planType: request.planType || 'N/A',
        jiraTaskUrl: request.jiraTaskUrl || '',
        jiraTaskKey: request.jiraTaskKey || '',
        type: requestType,
        Modify: requestType === 'Modify', // Mantener compatibilidad
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
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error fetching requests:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Error al obtener las solicitudes'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};