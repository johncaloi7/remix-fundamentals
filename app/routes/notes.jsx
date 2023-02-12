import { redirect } from "react-router";
import { useLoaderData, Link, useCatch } from "@remix-run/react";
import NewNote, { links as newNoteStyles } from "../components/NewNote";
import NoteList, { links as noteListLinks } from "../components/NoteList";
import { getStoredNotes, storeNotes } from "../data/notes";
import { json } from "@remix-run/node";

export default function NotesPage() {
  const notes = useLoaderData();
  return (
    <main>
      <NewNote />
      <NoteList notes={notes} />
    </main>
  );
}
export async function loader() {
  const notes = await getStoredNotes();
  if (!notes || notes.length === 0) {
    throw json(
      { message: "Your note list is empty." },
      { status: 404, statusText: "Not Found." }
    );
  }
  return notes;
}

export async function action({ request }) {
  const formData = await request.formData();
  const noteData = Object.fromEntries(formData);

  // add validation...
  if (noteData.title.trim().length < 5) {
    return { message: "Invalid title - must be over 5 characters." };
  }

  const existingNotes = await getStoredNotes();
  noteData.id = new Date().toISOString();
  const updatedNotes = existingNotes.concat(noteData);
  await storeNotes(updatedNotes);
  await new Promise((resolve, reject) => setTimeout(() => resolve(), 500));
  return redirect("/notes");
}

export function links() {
  return [...newNoteStyles(), ...noteListLinks()];
}

export function meta() {
  return {
    title: "All Notes",
    description: "Manage your notes with ease.",
  };
}

export function CatchBoundary() {
  const caughtResponse = useCatch();

  const message = caughtResponse.data?.message || "Data not found";

  return (
    <main>
      <NewNote />
      <p className="info-message">{message}</p>
    </main>
  );
}

export function ErrorBoundary({ error }) {
  return (
    <main className="error">
      <h1>Something went wrong.</h1>
      <p>{error.message}</p>
      <p>
        Back to <Link to="/">Home Page</Link>
      </p>
    </main>
  );
}
