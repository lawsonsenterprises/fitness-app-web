-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('check_in_submitted', 'message_received', 'client_accepted', 'client_inactive', 'programme_assigned', 'meal_plan_assigned')),
  title text NOT NULL,
  description text,
  link_url text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System/triggers can insert notifications (using service role)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create function to create notification on new message
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
  coach_client_record RECORD;
BEGIN
  -- Get the coach_clients record to determine recipient
  SELECT * INTO coach_client_record
  FROM public.coach_clients
  WHERE id = NEW.coach_client_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Determine recipient (the other party in the conversation)
  IF NEW.sender_id = coach_client_record.coach_id THEN
    recipient_id := coach_client_record.client_id;
  ELSE
    recipient_id := coach_client_record.coach_id;
  END IF;

  -- Get sender's display name
  SELECT COALESCE(display_name, contact_email, 'Someone') INTO sender_name
  FROM public.profiles
  WHERE id = NEW.sender_id;

  -- Create notification for recipient
  -- Link URL differs based on whether recipient is coach or athlete
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    description,
    link_url,
    metadata
  ) VALUES (
    recipient_id,
    'message_received',
    'New message from ' || sender_name,
    LEFT(NEW.content, 100) || CASE WHEN LENGTH(NEW.content) > 100 THEN '...' ELSE '' END,
    CASE
      WHEN recipient_id = coach_client_record.coach_id THEN '/clients/' || coach_client_record.id || '/messages'
      ELSE '/athlete/messages'
    END,
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'coach_client_id', NEW.coach_client_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message_create_notification ON public.coach_messages;
CREATE TRIGGER on_new_message_create_notification
  AFTER INSERT ON public.coach_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notification();

-- Grant permissions
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;
