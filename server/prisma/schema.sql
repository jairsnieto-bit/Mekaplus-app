--
-- PostgreSQL database dump
--

\restrict uoruojAoMbbHjgjW9BNM5ybN5VYEhSZosAMm9rNHZfpqJtsrzHpK16d9AGsfRnG

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'OPERATOR',
    'MESSENGER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    module text NOT NULL,
    description text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO postgres;

--
-- Name: Guide; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Guide" (
    id text NOT NULL,
    "guideNumber" text NOT NULL,
    "razonSocial" text NOT NULL,
    localidad text NOT NULL,
    direccion text NOT NULL,
    "identificacionUsuario" text,
    "referenciaEntrega" text,
    "fechaEntrega" timestamp(3) without time zone,
    "horaEntrega" text,
    estado text DEFAULT 'PENDIENTE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text NOT NULL,
    "senderId" text,
    "deliveryType" text,
    "evidenceImage" text
);


ALTER TABLE public."Guide" OWNER TO postgres;

--
-- Name: GuideConfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GuideConfig" (
    id text NOT NULL,
    logo text,
    "primaryColor" text DEFAULT '#0066CC'::text NOT NULL,
    "guidePrefix" text DEFAULT 'GUIA'::text NOT NULL,
    "guideStart" integer DEFAULT 1 NOT NULL,
    "guideEnd" integer DEFAULT 999999 NOT NULL,
    "currentNumber" integer DEFAULT 1 NOT NULL,
    "fieldsEnabled" jsonb DEFAULT '{"ciudad": true, "direccion": true, "razonSocial": true}'::jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."GuideConfig" OWNER TO postgres;

--
-- Name: GuideStatusHistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."GuideStatusHistory" (
    id text NOT NULL,
    "guideId" text NOT NULL,
    "previousStatus" text NOT NULL,
    "newStatus" text NOT NULL,
    observation text NOT NULL,
    "changedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryType" text,
    "evidenceImage" text
);


ALTER TABLE public."GuideStatusHistory" OWNER TO postgres;

--
-- Name: Sender; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sender" (
    id text NOT NULL,
    name text NOT NULL,
    nit text,
    address text,
    phone text,
    email text,
    department text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Sender" OWNER TO postgres;

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Setting" (
    id text NOT NULL,
    key text NOT NULL,
    value text,
    type text DEFAULT 'string'::text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Setting" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'OPERATOR'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "lastLoginAt" timestamp(3) without time zone,
    phone text,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: GuideConfig GuideConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuideConfig"
    ADD CONSTRAINT "GuideConfig_pkey" PRIMARY KEY (id);


--
-- Name: GuideStatusHistory GuideStatusHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuideStatusHistory"
    ADD CONSTRAINT "GuideStatusHistory_pkey" PRIMARY KEY (id);


--
-- Name: Guide Guide_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guide"
    ADD CONSTRAINT "Guide_pkey" PRIMARY KEY (id);


--
-- Name: Sender Sender_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sender"
    ADD CONSTRAINT "Sender_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AuditLog_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_action_idx" ON public."AuditLog" USING btree (action);


--
-- Name: AuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_createdAt_idx" ON public."AuditLog" USING btree ("createdAt");


--
-- Name: AuditLog_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "AuditLog_userId_idx" ON public."AuditLog" USING btree ("userId");


--
-- Name: GuideStatusHistory_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GuideStatusHistory_createdAt_idx" ON public."GuideStatusHistory" USING btree ("createdAt");


--
-- Name: GuideStatusHistory_guideId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "GuideStatusHistory_guideId_idx" ON public."GuideStatusHistory" USING btree ("guideId");


--
-- Name: Guide_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_createdAt_idx" ON public."Guide" USING btree ("createdAt");


--
-- Name: Guide_estado_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_estado_idx" ON public."Guide" USING btree (estado);


--
-- Name: Guide_guideNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_guideNumber_idx" ON public."Guide" USING btree ("guideNumber");


--
-- Name: Guide_guideNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Guide_guideNumber_key" ON public."Guide" USING btree ("guideNumber");


--
-- Name: Guide_senderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Guide_senderId_idx" ON public."Guide" USING btree ("senderId");


--
-- Name: Sender_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sender_isActive_idx" ON public."Sender" USING btree ("isActive");


--
-- Name: Sender_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Sender_name_idx" ON public."Sender" USING btree (name);


--
-- Name: Setting_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Setting_key_key" ON public."Setting" USING btree (key);


--
-- Name: User_deletedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_deletedAt_idx" ON public."User" USING btree ("deletedAt");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_role_idx" ON public."User" USING btree (role);


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GuideStatusHistory GuideStatusHistory_guideId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."GuideStatusHistory"
    ADD CONSTRAINT "GuideStatusHistory_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES public."Guide"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Guide Guide_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guide"
    ADD CONSTRAINT "Guide_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Guide Guide_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Guide"
    ADD CONSTRAINT "Guide_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."Sender"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict uoruojAoMbbHjgjW9BNM5ybN5VYEhSZosAMm9rNHZfpqJtsrzHpK16d9AGsfRnG

