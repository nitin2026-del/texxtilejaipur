import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://evtjgujsfllegfmtqspq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dGpndWpzZmxsZWdmbXRxc3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwODg1NTIsImV4cCI6MjA5NDY2NDU1Mn0.Kz_BZk3rpr3kAWV6fMaEu0kPqOtQdFZx8TTRGT_BzKQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  console.log('Attempting signup...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'akshaygupta24042007@gmail.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Akshay',
          last_name: 'Gupta',
        }
      }
    });
    console.log('Result:', JSON.stringify({ data, error }, null, 2));
  } catch (err) {
    console.error('Exception caught:', err);
  }
}

testSignup();
