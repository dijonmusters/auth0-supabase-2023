import styles from "../styles/Home.module.css";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { getSupabase } from "../utils/supabase";
import Link from "next/link";
import { useState } from "react";

const Index = ({ user, todos }) => {
  const [content, setContent] = useState("");
  const [allTodos, setAllTodos] = useState([...todos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const supabase = await getSupabase(user.accessToken);
    const { data } = await supabase
      .from("todos")
      .insert({ content, user_id: user.sub })
      .select();

    setAllTodos([...todos, data[0]]);
    setContent("");
  };

  return (
    <div className={styles.container}>
      <p>
        Welcome {user.name}! <Link href="/api/auth/logout">Logout</Link>
      </p>
      <form onSubmit={handleSubmit}>
        <input onChange={(e) => setContent(e.target.value)} value={content} />
        <button>Add</button>
      </form>
      {allTodos?.length > 0 ? (
        allTodos.map((todo) => <p key={todo.id}>{todo.content}</p>)
      ) : (
        <p>You have completed all todos!</p>
      )}
    </div>
  );
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps({ req, res }) {
    const {
      user: { accessToken },
    } = await getSession(req, res);

    const supabase = await getSupabase(accessToken);

    const { data: todos } = await supabase.from("todos").select("*");

    return {
      props: { todos },
    };
  },
});

export default Index;
