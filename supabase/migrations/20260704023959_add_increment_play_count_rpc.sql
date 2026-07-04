/*
# Add increment_play_count RPC

Creates a security definer function to atomically increment a song's play_count.
This avoids RLS issues with updating the songs table from the client.
*/

CREATE OR REPLACE FUNCTION public.increment_play_count(song_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.songs SET play_count = play_count + 1 WHERE id = song_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_play_count(uuid) TO authenticated;
