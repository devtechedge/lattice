import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Role } from "@/lib/catalog/types";

export type BookmarkRow = { role_id: string };
export type ApplicationRow = {
  id: string;
  user_id: string;
  role_id: string;
  name: string;
  email: string;
  github: string | null;
  linkedin: string | null;
  telegram: string | null;
  location: string | null;
  cover_letter: string;
  answers_json: string;
  stage: string;
  created_at: string;
};
export type PostedRow = { id: string; user_id: string | null; payload_json: string; published_at: string; status?: string };
export type ContractRow = {
  id: string;
  user_id: string;
  talent_id: string | null;
  kind: string;
  source_id: string;
  payload_json: string;
  status: string;
  created_at: string;
};
export type ProfileRow = { user_id: string; payload_json: string };

export const listPostedRoles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<PostedRow>`select id, user_id, payload_json, published_at, status from posted_roles where status = 'open' order by published_at desc`;
});

export const listPostedGigs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<PostedRow>`select id, user_id, payload_json, published_at from posted_gigs order by published_at desc`;
});

export const listPostedProjects = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<PostedRow>`select id, user_id, payload_json, published_at from posted_projects order by published_at desc`;
});

export const listSalarySubs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ role_key: string; seniority: string | null; region: string | null; cash: number; token_value: number; equity_value: number; year: number }>`select role_key, seniority, region, cash, token_value, equity_value, year from salary_submissions order by created_at desc limit 80`;
});

export const listBookmarks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<BookmarkRow>`select role_id from bookmarks where user_id = ${context.userId}`;
  });

export const toggleBookmark = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ roleId: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ role_id: string }>`select role_id from bookmarks where user_id = ${context.userId} and role_id = ${data.roleId}`;
    if (existing.length) {
      await sql`delete from bookmarks where user_id = ${context.userId} and role_id = ${data.roleId}`;
      return { saved: false };
    }
    await sql`insert into bookmarks (user_id, role_id) values (${context.userId}, ${data.roleId})`;
    return { saved: true };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      roleId: z.string(),
      name: z.string().min(1),
      email: z.string().email(),
      github: z.string().optional(),
      linkedin: z.string().optional(),
      telegram: z.string().optional(),
      location: z.string().optional(),
      coverLetter: z.string(),
      answers: z.array(z.string()),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into applications (id, user_id, role_id, name, email, github, linkedin, telegram, location, cover_letter, answers_json)
      values (${id}, ${context.userId}, ${data.roleId}, ${data.name}, ${data.email}, ${data.github ?? null}, ${data.linkedin ?? null}, ${data.telegram ?? null}, ${data.location ?? null}, ${data.coverLetter}, ${JSON.stringify(data.answers)})`;
    return { id };
  });

export const listMyApplications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<ApplicationRow>`select * from applications where user_id = ${context.userId} order by created_at desc`;
  });

export const listStudioApplications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<ApplicationRow>`select * from applications where role_id in (select id from posted_roles where user_id = ${context.userId}) order by created_at desc`;
  });

export const setApplicationStage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), stage: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update applications set stage = ${data.stage}
      where id = ${data.id} and role_id in (select id from posted_roles where user_id = ${context.userId})`;
    return { ok: true };
  });

const rolePayload = z.object({
  title: z.string().min(2),
  department: z.string(),
  seniority: z.string(),
  type: z.string(),
  locationMode: z.string(),
  remoteRegion: z.string().optional(),
  locations: z.array(z.string()).optional(),
  chains: z.array(z.string()),
  scenes: z.array(z.string()),
  tags: z.array(z.string()),
  descriptionMarkdown: z.string().min(20),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  tokenAllocation: z.number().optional(),
  tokenTicker: z.string().optional(),
  vestingMonths: z.number().optional(),
  cliffMonths: z.number().optional(),
  applyEmail: z.string().optional(),
  applyUrl: z.string().optional(),
  companyName: z.string().min(2),
  screeningQuestions: z.array(z.string()).optional(),
});

export const publishRole = createServerFn({ method: "POST" })
  .validator(rolePayload)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    const role: Partial<Role> & { companyName: string } = {
      id,
      slug: id,
      companyId: "user",
      title: data.title,
      department: data.department as Role["department"],
      seniority: data.seniority as Role["seniority"],
      type: data.type as Role["type"],
      locationMode: data.locationMode as Role["locationMode"],
      remoteRegion: data.remoteRegion as Role["remoteRegion"],
      locations: data.locations ?? [],
      chains: data.chains as Role["chains"],
      scenes: data.scenes as Role["scenes"],
      tags: data.tags as Role["tags"],
      descriptionMarkdown: data.descriptionMarkdown,
      responsibilities: [],
      requirements: [],
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      salaryCurrency: (data.salaryCurrency as Role["salaryCurrency"]) ?? "USD",
      salaryPeriod: "year",
      tokenAllocation: data.tokenAllocation,
      tokenTicker: data.tokenTicker,
      vestingMonths: data.vestingMonths,
      cliffMonths: data.cliffMonths,
      applyEmail: data.applyEmail,
      applyUrl: data.applyUrl,
      benefits: [],
      featured: false,
      publishedAt: new Date().toISOString(),
      screeningQuestions: data.screeningQuestions ?? [],
      status: "open",
      source: "user",
      companyName: data.companyName,
    };
    await sql`insert into posted_roles (id, user_id, payload_json) values (${id}, ${null}, ${JSON.stringify(role)})`;
    return { id };
  });

export const publishRoleAuthed = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(rolePayload)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    const payload = { ...data, id, slug: id, source: "user", publishedAt: new Date().toISOString(), companyId: context.userId, status: "open", salaryPeriod: "year", benefits: [], featured: false, responsibilities: [], requirements: [] };
    await sql`insert into posted_roles (id, user_id, payload_json) values (${id}, ${context.userId}, ${JSON.stringify(payload)})`;
    return { id };
  });

export const listMyPostedRoles = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<PostedRow>`select id, user_id, payload_json, published_at, status from posted_roles where user_id = ${context.userId} order by published_at desc`;
  });

export const publishGig = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string().min(4),
      category: z.string(),
      description: z.string().min(20),
      priceBasic: z.number(),
      priceStandard: z.number(),
      pricePro: z.number(),
      token: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into posted_gigs (id, user_id, payload_json) values (${id}, ${context.userId}, ${JSON.stringify({ ...data, id, slug: id, talentId: context.userId, source: "user" })})`;
    return { id };
  });

export const publishProject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      title: z.string().min(4),
      description: z.string().min(20),
      budgetMin: z.number(),
      budgetMax: z.number(),
      token: z.string(),
      durationWeeks: z.number(),
      companyName: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into posted_projects (id, user_id, payload_json) values (${id}, ${context.userId}, ${JSON.stringify({ ...data, id, slug: id, companyId: context.userId, source: "user", status: "open", publishedAt: new Date().toISOString(), network: "base", skills: [], locationMode: "remote" })})`;
    return { id };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      displayName: z.string().min(2),
      headline: z.string().min(4),
      bio: z.string(),
      skills: z.array(z.string()),
      chains: z.array(z.string()),
      what: z.string(),
      privacy: z.enum(["public", "network", "hidden"]),
      openToGigs: z.boolean(),
      womenInWeb3: z.boolean(),
      location: z.string(),
      seniority: z.string(),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`insert into talent_profiles (user_id, payload_json) values (${context.userId}, ${JSON.stringify(data)})
      on conflict (user_id) do update set payload_json = excluded.payload_json, updated_at = now()`;
    return { ok: true };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`select user_id, payload_json from talent_profiles where user_id = ${context.userId}`;
    return rows[0] ?? null;
  });

export const listPublicProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<ProfileRow>`select user_id, payload_json from talent_profiles`;
  return rows.filter((r) => {
    try {
      const p = JSON.parse(r.payload_json) as { privacy?: string };
      return p.privacy === "public";
    } catch {
      return false;
    }
  });
});

export const createContract = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    z.object({
      kind: z.enum(["gig", "project"]),
      sourceId: z.string(),
      talentId: z.string().optional(),
      payload: z.record(z.string(), z.any()),
    }),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into contracts (id, user_id, talent_id, kind, source_id, payload_json, status)
      values (${id}, ${context.userId}, ${data.talentId ?? null}, ${data.kind}, ${data.sourceId}, ${JSON.stringify(data.payload)}, 'funded')`;
    return { id };
  });

export const listMyContracts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<ContractRow>`select * from contracts where user_id = ${context.userId} or talent_id = ${context.userId} order by created_at desc`;
  });

export const advanceContract = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ id: z.string(), status: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await sql`update contracts set status = ${data.status} where id = ${data.id} and (user_id = ${context.userId} or talent_id = ${context.userId})`;
    return { ok: true };
  });

export const submitSalary = createServerFn({ method: "POST" })
  .validator(
    z.object({
      roleKey: z.string(),
      seniority: z.string().optional(),
      region: z.string().optional(),
      cash: z.number(),
      tokenValue: z.number(),
      equityValue: z.number(),
      year: z.number(),
      note: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into salary_submissions (id, role_key, seniority, region, cash, token_value, equity_value, year, note)
      values (${id}, ${data.roleKey}, ${data.seniority ?? null}, ${data.region ?? null}, ${data.cash}, ${data.tokenValue}, ${data.equityValue}, ${data.year}, ${data.note ?? null})`;
    return { id };
  });

export const createAlert = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ channel: z.string(), cadence: z.string(), filter: z.record(z.string(), z.any()) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into alerts (id, user_id, channel, filter_json, cadence) values (${id}, ${context.userId}, ${data.channel}, ${JSON.stringify(data.filter)}, ${data.cadence})`;
    return { id };
  });

export const listMyAlerts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: string; channel: string; cadence: string; filter_json: string }>`select id, channel, cadence, filter_json from alerts where user_id = ${context.userId} order by created_at desc`;
  });

export const toggleShortlist = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ talentId: z.string() }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql`select talent_id from shortlists where user_id = ${context.userId} and talent_id = ${data.talentId}`;
    if (existing.length) {
      await sql`delete from shortlists where user_id = ${context.userId} and talent_id = ${data.talentId}`;
      return { saved: false };
    }
    await sql`insert into shortlists (user_id, talent_id) values (${context.userId}, ${data.talentId})`;
    return { saved: true };
  });

export const listShortlist = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ talent_id: string }>`select talent_id from shortlists where user_id = ${context.userId}`;
  });

export const submitProposal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(z.object({ projectId: z.string(), note: z.string().min(8) }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`insert into proposals (id, user_id, project_id, note) values (${id}, ${context.userId}, ${data.projectId}, ${data.note})`;
    return { id };
  });
