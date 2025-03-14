import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // Get raw body data
    const body = await readBody(event);
    
    // Log the received data
    console.log('Received event data:', body);

    // Return success response
    return {
      success: true,
      event: {
        id: 'test-' + Date.now(),
        title: body.title || 'Test Event',
        status: 'pending',
        message: 'Event created successfully and is pending review'
      }
    };

  } catch (error) {
    console.error('Error in test endpoint:', error);
    
    return {
      success: false,
      message: error.message || 'Error creating event'
    };
  }
});
