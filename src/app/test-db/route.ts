import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: 'Database connection failed'
        },
        { status: 500 }
      );
    }

    // Test reading from florida_data
    const { data: floridaData, error: floridaError } = await supabase
      .from('florida_data')
      .select('*')
      .limit(5);

    // Test reading from new_york_data
    const { data: nyData, error: nyError } = await supabase
      .from('new_york_data')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables: {
        profiles: { count: data },
        florida_data: { 
          success: !floridaError,
          count: floridaData?.length || 0,
          error: floridaError?.message
        },
        new_york_data: { 
          success: !nyError,
          count: nyData?.length || 0,
          error: nyError?.message
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: 'Unexpected error occurred'
      },
      { status: 500 }
    );
  }
}