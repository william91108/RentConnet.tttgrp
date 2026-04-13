const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { issueTitle, recipientEmail, message, type } = await req.json()

    if (!issueTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing issueTitle' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log(`[notify-issue-update] type=${type}, to=${recipientEmail}, issue=${issueTitle}`)

    if (type === 'new_issue') {
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')

      if (admins?.length) {
        for (const admin of admins) {
          await supabase.from('notices').insert({
            title: `New Issue: ${issueTitle}`,
            content: message || 'A new issue has been submitted.',
            created_by: admin.user_id,
            notice_type: 'maintenance',
            target_all_house: false,
            target_user_id: admin.user_id,
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('[notify-issue-update] Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
