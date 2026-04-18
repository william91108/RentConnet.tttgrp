const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3'

const APP_URL = Deno.env.get('APP_URL') ?? 'https://id-preview--b20aeec3-17ae-4dcc-8561-5879b1ae0e15.lovable.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type, recipientEmail, recipientUserId } = body

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    console.log(`[notify] type=${type}, to=${recipientEmail ?? recipientUserId}`)

    // Build email content based on type
    let subject = ''
    let htmlBody = ''
    let plainContent = ''

    if (type === 'new_issue') {
      const { issueTitle, message } = body
      subject = `New Issue Reported: ${issueTitle}`
      plainContent = message ?? 'A new issue has been submitted.'
      htmlBody = renderEmail({
        title: 'New Issue Reported',
        heading: issueTitle,
        body: plainContent,
        ctaLabel: 'View Issue in Admin Panel',
        ctaUrl: `${APP_URL}/admin/issues`,
      })

      // Look up admin emails so we can email them all
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin')
      const adminIds = (admins ?? []).map((a: any) => a.user_id)
      const { data: adminProfiles } = adminIds.length
        ? await supabase.from('profiles').select('email').in('user_id', adminIds)
        : { data: [] as any[] }
      const adminEmails = (adminProfiles ?? []).map((p: any) => p.email).filter(Boolean)
      ;(body as any).__multiRecipients = adminEmails
    } else if (type === 'admin_reply') {
      const { issueTitle, message, issueId } = body
      subject = `Update on your issue: ${issueTitle}`
      plainContent = message ?? ''
      htmlBody = renderEmail({
        title: 'Admin replied to your issue',
        heading: issueTitle,
        body: plainContent,
        ctaLabel: 'View Conversation',
        ctaUrl: `${APP_URL}/issues${issueId ? `?id=${issueId}` : ''}`,
      })
    } else if (type === 'new_notice') {
      const { noticeTitle, noticeContent } = body
      subject = `New notice: ${noticeTitle}`
      plainContent = noticeContent ?? ''
      htmlBody = renderEmail({
        title: 'New notice from your property manager',
        heading: noticeTitle,
        body: plainContent,
        ctaLabel: 'Open Notices',
        ctaUrl: `${APP_URL}/notices`,
      })
    } else {
      return new Response(JSON.stringify({ error: 'Unknown type' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build recipient list — single or multi
    const multi = ((body as any).__multiRecipients as string[] | undefined) ?? []
    const recipients = multi.length ? multi : (recipientEmail ? [recipientEmail] : [])

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey && recipients.length) {
      for (const to of recipients) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'RentConnect <onboarding@resend.dev>',
            to: [to],
            subject,
            html: htmlBody,
          }),
        })
        const result = await res.json()
        console.log('[notify] resend ->', to, res.status, result)
        if (!res.ok) console.error('[notify] Resend send failed for', to, result)
      }
    } else {
      console.log(`[notify] No RESEND_API_KEY configured or no recipient — email skipped. Would send to: ${recipients.join(', ')}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[notify] Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function renderEmail(opts: { title: string; heading: string; body: string; ctaLabel: string; ctaUrl: string }) {
  const safeBody = (opts.body || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#222">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;max-width:560px">
        <tr><td>
          <p style="margin:0 0 8px;color:#888;font-size:12px;letter-spacing:0.05em;text-transform:uppercase">${opts.title}</p>
          <h1 style="margin:0 0 16px;font-size:20px;color:#111">${opts.heading}</h1>
          <div style="font-size:14px;line-height:1.6;color:#333;margin:0 0 24px">${safeBody}</div>
          <a href="${opts.ctaUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px">${opts.ctaLabel}</a>
          <p style="margin:32px 0 0;font-size:12px;color:#999">Stay in Harmony — Property Portal</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`
}
