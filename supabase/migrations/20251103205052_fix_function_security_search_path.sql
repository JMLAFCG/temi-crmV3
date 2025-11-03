/*
  # Sécurisation des fonctions - Search Path

  ## Problème
  Les fonctions ont un search_path mutable qui peut être exploité pour des injections.
  Cela permet à un attaquant de créer des objets malveillants dans un schema accessible.

  ## Solution
  Définir explicitement le search_path dans chaque fonction et utiliser SECURITY DEFINER
  avec précaution.

  ## Fonctions concernées
  - handle_new_user
  - update_conversations_updated_at
  - update_messages_updated_at
  - update_appointments_updated_at
  - update_conversation_on_new_message

  ## Sécurité
  - search_path fixé à 'public, pg_catalog'
  - Prévention des injections schema
*/

-- ============================================================================
-- Fonction: handle_new_user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- L'utilisateur existe déjà, on ne fait rien
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas la création auth
    RAISE WARNING 'Erreur lors de la création de l''utilisateur: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- ============================================================================
-- Fonction: update_conversations_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Fonction: update_messages_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_messages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Fonction: update_appointments_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_appointments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Fonction: update_conversation_on_new_message
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_conversation_on_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- Vérification des triggers (pas de changement nécessaire)
-- ============================================================================

-- Les triggers existants restent actifs et utilisent les nouvelles fonctions sécurisées

-- Trigger pour handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour update_conversations_updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at_trigger ON conversations;
CREATE TRIGGER update_conversations_updated_at_trigger
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversations_updated_at();

-- Trigger pour update_messages_updated_at
DROP TRIGGER IF EXISTS update_messages_updated_at_trigger ON messages;
CREATE TRIGGER update_messages_updated_at_trigger
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_messages_updated_at();

-- Trigger pour update_appointments_updated_at
DROP TRIGGER IF EXISTS update_appointments_updated_at_trigger ON appointments;
CREATE TRIGGER update_appointments_updated_at_trigger
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_appointments_updated_at();

-- Trigger pour update_conversation_on_new_message
DROP TRIGGER IF EXISTS update_conversation_on_new_message_trigger ON messages;
CREATE TRIGGER update_conversation_on_new_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_new_message();