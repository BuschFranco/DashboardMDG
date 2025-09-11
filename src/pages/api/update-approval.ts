import type { APIRoute } from 'astro';
import { updateApprovalStatus, connectToDatabase } from '../../lib/mongodb';
import { addCommentToJiraTask, updateJiraTaskStatus, getJiraTaskTransitions } from '../../lib/jira';
import { ObjectId } from 'mongodb';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('API received request body:', body);
    
    const { requestId, newStatus, token } = body;
    console.log('Extracted values:', { token: token ? '[PRESENT]' : '[MISSING]', requestId, newStatus });
    
    // Verificar token de autenticación
    const MAXI_TOKEN = process.env.MAXI_APPROVAL_TOKEN || 'maxi-secret-token-2024';
    const ADMIN_TOKEN = process.env.ADMIN_APPROVAL_TOKEN || '4444';
    
    const isMaxiToken = token === MAXI_TOKEN;
    const isAdminToken = token === ADMIN_TOKEN;
    
    if (!isMaxiToken && !isAdminToken) {
      console.log('Token validation failed');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Token de autenticación inválido' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('Token validation passed');

    // Validar parámetros
    if (!requestId || !newStatus) {
      console.log('Missing required parameters:', { requestId: !!requestId, newStatus: !!newStatus });
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'requestId y newStatus son requeridos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log('Required parameters validation passed');

    // Validar que el nuevo estado sea válido
    const validStatuses = ['Aprobado', 'Pendiente', 'Rechazado', 'En Revisión'];
    if (!validStatuses.includes(newStatus)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Estado inválido. Debe ser: Aprobado, Pendiente, Rechazado o En Revisión' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Conectar a la base de datos
    console.log('Connecting to database...');
    const { db } = await connectToDatabase();
    const collection = db.collection('requests');
    console.log('Database connection established');

    // Verificar que el requestId es un ObjectId válido
    console.log('Validating ObjectId:', requestId);
    if (!ObjectId.isValid(requestId)) {
      console.log('Invalid ObjectId format');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'ID de solicitud inválido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar el documento antes de actualizarlo para obtener el jiraTaskKey
    const existingRequest = await collection.findOne({ _id: new ObjectId(requestId) });
    
    if (!existingRequest) {
      console.log('No document found with ID:', requestId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Solicitud no encontrada' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar el documento
    console.log('Attempting to update document with ID:', requestId);
    
    // Determinar qué campo actualizar según el token
    const updateField = isAdminToken ? 'adminApproval' : 'maxiApproval';
    const updatedBy = isAdminToken ? 'Admin' : 'Maxi';
    
    const result = await collection.updateOne(
      { _id: new ObjectId(requestId) },
      { 
        $set: { 
          [updateField]: newStatus,
          updatedAt: new Date(),
          updatedBy: updatedBy
        } 
      }
    );
    
    console.log('Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged
    });

    if (result.matchedCount === 0) {
      console.log('No document found with ID:', requestId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No se pudo actualizar la solicitud' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si es aprobación de admin y existe una tarea de Jira, manejar cambios de estado y comentarios
    let jiraCommentSent = false;
    let jiraStatusUpdated = false;
    
    if (isAdminToken && existingRequest.jiraTaskKey) {
      console.log('Processing Jira updates for task:', existingRequest.jiraTaskKey);
      
      if (newStatus === 'Aprobado') {
        // Cambiar estado de Jira a "Approved"
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, 'Approved');
        
        // Enviar comentario de aprobación
        const commentText = "Automatically generated message: The status of this task is: APPROVED";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
        
      } else if (newStatus === 'Pendiente') {
        // Cambiar estado de Jira a "Waiting for approval"
        jiraStatusUpdated = await updateJiraTaskStatus(existingRequest.jiraTaskKey, 'Waiting for approval');
        
        // Enviar comentario de pendiente
        const commentText = "Automatically generated message: The status of this task has returned to PENDING.";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
        
      } else if (newStatus === 'Rechazado') {
        // Enviar comentario de rechazo
        const commentText = "Automatically generated message: The status of this request is: REFUSED.";
        jiraCommentSent = await addCommentToJiraTask(existingRequest.jiraTaskKey, commentText);
      }
      
      if (jiraStatusUpdated) {
        console.log('Jira status updated successfully');
      } else if (newStatus === 'Aprobado' || newStatus === 'Pendiente') {
        console.warn(`Failed to update Jira status for task ${existingRequest.jiraTaskKey}`);
      }
      
      if (jiraCommentSent) {
        console.log('Jira comment sent successfully');
      } else {
        console.warn(`Failed to send Jira comment for task ${existingRequest.jiraTaskKey}`);
      }
    }

    console.log('Update successful');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Estado actualizado correctamente',
      jiraCommentSent: jiraCommentSent,
      jiraStatusUpdated: jiraStatusUpdated
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating approval status:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};