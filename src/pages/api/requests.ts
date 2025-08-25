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
    
    if (search) {
      filter.$or = [
        { devId: { $regex: search, $options: 'i' } },
        { requesterName: { $regex: search, $options: 'i' } },
        { product: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (country) {
      filter.country = { $regex: country, $options: 'i' };
    }
    
    if (product) {
      filter.product = { $regex: product, $options: 'i' };
    }
    
    if (adminApproval) {
      filter.adminApproval = { $regex: adminApproval, $options: 'i' };
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
    const transformedRequests = requests.map((request: any) => ({
      devId: request.devId || 'N/A',
      createdAt: request.createdAt || new Date(),
      requesterName: request.requesterName || 'N/A',
      adminApproval: request.adminApproval || 'Pendiente',
      country: request.country || 'N/A',
      product: request.product || 'N/A',
      planType: request.planType || 'N/A',
      jiraTaskUrl: request.jiraTaskUrl || '',
      _id: request._id.toString()
    }));
    
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