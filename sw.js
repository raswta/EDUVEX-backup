import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  "https://linktr.ee/Raswta",
  Deno.env.get("VAPID_PUBLIC"),
  Deno.env.get("VAPID_PRIVATE")
);
const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

Deno.serve(async () => {
  const now = new Date();
  const { data: jobs } = await sb.from("push_jobs").select("*").eq("sent", false).lte("fire_at", now.toISOString());
  let sent = 0;
  for (const j of jobs || []) {
    const { data: claimed } = await sb.from("push_jobs").update({ sent: true }).eq("id", j.id).eq("sent", false).select();
    if (!claimed || !claimed.length) continue;
    const { data: subs } = await sb.from("push_subs").select("*").eq("user_id", j.user_id);
    for (const s of subs || []) {
      try {
        await webpush.sendNotification(s.sub, JSON.stringify({
          title: "EDUVEX",
          body: `Your stopwatch has been running for ${j.minutes} minutes!`,
          tag: `ev-alert-${j.minutes}`
        }));
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", s.endpoint);
        console.error("push failed", e.statusCode, e.body);
      }
    }
  }
  await sb.from("push_jobs").delete().eq("sent", true).lt("fire_at", new Date(now.getTime() - 86400000).toISOString());
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
