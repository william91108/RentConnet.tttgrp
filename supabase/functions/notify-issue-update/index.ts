const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.95.3')
    const { issueId, issueTitle, recipientEmail, message, type } = await req.json()

    if (!recipientEmail || !issueTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use Lovable AI Gateway to compose and send notification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // For now, log the notification. Email sending will be configured when email domain is set up.
    console.log(`[notify-issue-update] type=${type}, to=${recipientEmail}, issue=${issueTitle}`)
    console.log(`[notify-issue-update] message: ${message}`)

    // Store as a notice in the database for the user
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    if (type === 'new_issue') {
      // Notify admin about new issue - get admin user ids
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
