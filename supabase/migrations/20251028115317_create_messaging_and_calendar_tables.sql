/*
  # Create messaging and calendar tables

  ## Tables créées

  ### 1. conversations
  Table pour gérer les conversations entre utilisateurs
  - `id` (uuid, primary key)
  - `title` (text, optional) - Nom de la conversation
  - `project_id` (uuid, optional) - Lien vers un projet
  - `participants` (uuid[]) - Liste des participants (array d'UUIDs)
  - `last_message_at` (timestamptz) - Date du dernier message
  - `last_message_preview` (text) - Aperçu du dernier message
  - `created_by` (uuid) - Créateur de la conversation
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. messages
  Table pour stocker les messages
  - `id` (uuid, primary key)
  - `conversation_id` (uuid) - Référence vers conversations
  - `sender_id` (uuid) - Expéditeur du message
  - `content` (text) - Contenu du message
  - `is_read` (boolean) - Message lu ou non
  - `read_by` (uuid[]) - Liste des utilisateurs ayant lu
  - `attachments` (jsonb) - Pièces jointes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. appointments
  Table pour les rendez-vous et événements du calendrier
  - `id` (uuid, primary key)
  - `title` (text) - Titre de l'événement
  - `description` (text) - Description
  - `start_time` (timestamptz) - Date/heure de début
  - `end_time` (timestamptz) - Date/heure de fin
  - `location` (text) - Lieu
  - `project_id` (uuid, optional) - Lien vers un projet
  - `participants` (uuid[]) - Participants
  - `status` (text) - Statut: scheduled, completed, cancelled
  - `reminder_sent` (boolean) - Rappel envoyé
  - `created_by` (uuid) - Créateur
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Sécurité (RLS)
  - Les utilisateurs peuvent voir leurs conversations/messages
  - Les participants peuvent lire/écrire dans leurs conversations
  - Les utilisateurs peuvent voir leurs événements

  ## Performance
  - Index sur participants (GIN pour arrays)
  - Index sur dates pour tri et recherche
  - Index sur conversation_id pour les messages
*/

-- ===== TABLE: conversations =====
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  project_id uuid,
  participants uuid[] NOT NULL DEFAULT '{}',
  last_message_at timestamptz DEFAULT now(),
  last_message_preview text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Participants can update conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants))
  WITH CHECK (auth.uid() = ANY(participants));

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);

-- ===== TABLE: messages =====
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  read_by uuid[] DEFAULT '{}',
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = false;

-- ===== TABLE: appointments =====
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  location text,
  project_id uuid,
  participants uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  reminder_sent boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = ANY(participants)
  );

CREATE POLICY "Users can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() = ANY(participants)
  )
  WITH CHECK (
    auth.uid() = created_by OR
    auth.uid() = ANY(participants)
  );

CREATE POLICY "Users can delete their appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_appointments_participants ON appointments USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_appointments_project_id ON appointments(project_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_end_time ON appointments(end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ===== FUNCTIONS =====

-- Function to update updated_at on conversations
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Function to update updated_at on messages
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Function to update updated_at on appointments
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- Function to update conversation last_message info when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();