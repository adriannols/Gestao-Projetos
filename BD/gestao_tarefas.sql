-- Database: gestao_tarefas

-- DROP DATABASE IF EXISTS gestao_tarefas;

CREATE DATABASE gestao_tarefas
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Portuguese_Brazil.1252'
    LC_CTYPE = 'Portuguese_Brazil.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


-- Table: public.prj_gestaoprojeto

-- DROP TABLE IF EXISTS public.prj_gestaoprojeto;

CREATE TABLE IF NOT EXISTS public.prj_gestaoprojeto
(
    prj_id integer NOT NULL DEFAULT nextval('prj_gestaoprojeto_prj_id_seq'::regclass),
    prj_descricao character varying(255) COLLATE pg_catalog."default",
    prj_status character varying(1) COLLATE pg_catalog."default" NOT NULL,
    prj_datainclusao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    prj_dataconclusao timestamp without time zone,
    CONSTRAINT prj_gestaoprojeto_pkey PRIMARY KEY (prj_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.prj_gestaoprojeto
    OWNER to postgres;

-- Table: public.trf_gestaotarefa

-- DROP TABLE IF EXISTS public.trf_gestaotarefa;

CREATE TABLE IF NOT EXISTS public.trf_gestaotarefa
(
    trf_id integer NOT NULL DEFAULT nextval('trf_gestaotarefa_trf_id_seq'::regclass),
    trf_codigo character varying(10) COLLATE pg_catalog."default" NOT NULL,
    trf_descricao character varying(255) COLLATE pg_catalog."default" NOT NULL,
    prj_id integer,
    trf_status character varying(1) COLLATE pg_catalog."default",
    trf_datainclusao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    trf_dataconclusao timestamp without time zone,
    trf_titulo character varying(60) COLLATE pg_catalog."default",
    CONSTRAINT trf_gestaotarefa_pkey PRIMARY KEY (trf_id),
    CONSTRAINT fk_prj_id FOREIGN KEY (prj_id)
        REFERENCES public.prj_gestaoprojeto (prj_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.trf_gestaotarefa
    OWNER to postgres;

-- Trigger: trg_trf_gestaotarefa

-- DROP TRIGGER IF EXISTS trg_trf_gestaotarefa ON public.trf_gestaotarefa;

CREATE OR REPLACE TRIGGER trg_trf_gestaotarefa
    BEFORE INSERT
    ON public.trf_gestaotarefa
    FOR EACH ROW
    EXECUTE FUNCTION public.trf_gerar_proximo_codigo();

-- FUNCTION: public.trf_gerar_proximo_codigo()

-- DROP FUNCTION IF EXISTS public.trf_gerar_proximo_codigo();

CREATE OR REPLACE FUNCTION public.trf_gerar_proximo_codigo()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    novo_codigo VARCHAR(10);
BEGIN
    SELECT 'ART-' || LPAD(NEW.trf_id::TEXT, 4, '0')
    INTO novo_codigo;

    NEW.trf_codigo := novo_codigo;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.trf_gerar_proximo_codigo()
    OWNER TO postgres;
