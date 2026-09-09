-- Adiciona um subtópico opcional diretamente ao projeto.
-- Projetos existentes permanecem intactos e recebem valor vazio.

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS subcategory varchar(255) DEFAULT '';
