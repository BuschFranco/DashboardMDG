import type { APIRoute } from 'astro';
import { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { addCommentToJiraTask } from '../../lib/jira';

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('id');

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'ID de solicitud requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validar que el ID sea un ObjectId válido
    if (!ObjectId.isValid(requestId)) {
      return new Response(JSON.stringify({ error: 'ID de solicitud inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('requests');

    // Primero obtener los datos del registro antes de eliminarlo
    const requestData = await collection.findOne({ _id: new ObjectId(requestId) });

    if (!requestData) {
      return new Response(JSON.stringify({ error: 'Solicitud no encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar el documento
    const result = await collection.deleteOne({ _id: new ObjectId(requestId) });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: 'Error al eliminar la solicitud' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Enviar comentario a Jira si existe una tarea asociada
    if (requestData.jiraTaskKey) {
      try {
        await addCommentToJiraTask(
          requestData.jiraTaskKey,
          'This Request has been ELIMINATED from the system.'
        );
        console.log(`Comentario enviado a Jira task: ${requestData.jiraTaskKey}`);
      } catch (jiraError) {
        console.error('Error al enviar comentario a Jira:', jiraError);
        // No fallar la eliminación si Jira falla
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Solicitud eliminada correctamente' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al eliminar solicitud:', error);
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};