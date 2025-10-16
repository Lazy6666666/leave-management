import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const usersToCreate = [
  {
    email: "test.employee@example.com",
    password: "password123",
    user_metadata: { role: "employee", first_name: "Test", last_name: "Employee", department: "Engineering" },
  },
  {
    email: "test.manager@example.com",
    password: "password123",
    user_metadata: { role: "manager", first_name: "Test", last_name: "Manager", department: "Engineering" },
  },
  {
    email: "test.hr@example.com",
    password: "password123",
    user_metadata: { role: "hr", first_name: "Test", last_name: "HR", department: "Human Resources" },
  },
  {
    email: "test.admin@example.com",
    password: "password123",
    user_metadata: { role: "admin", first_name: "Test", last_name: "Admin", department: "Administration" },
  },
];

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    for (const user of usersToCreate) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: user.user_metadata,
        email_confirm: true,
      });

      if (error) {
        console.error(`Error creating user ${user.email}:`, error);
      } else {
        console.log(`User ${user.email} created successfully.`);
        // Also insert into public.employees
        const { error: insertError } = await supabase.from("employees").insert({
          supabase_id: data.user.id,
          email: data.user.email,
          first_name: data.user.user_metadata.first_name,
          last_name: data.user.user_metadata.last_name,
          role: data.user.user_metadata.role,
          department: data.user.user_metadata.department,
        });
        if (insertError) {
            console.error(`Error inserting employee ${user.email}:`, insertError);
        }
      }
    }
    return new Response("Test users creation process finished.", { status: 200 });
  } catch (e) {
    return new Response(`Internal Server Error: ${(e as Error).message}`, { status: 500 });
  }
});