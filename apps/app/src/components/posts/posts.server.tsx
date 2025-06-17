export async function PostsServer() {
  // TODO: Fetch posts from new backend
  const data = [
    { id: 1, title: "Sample Post 1" },
    { id: 2, title: "Sample Post 2" },
  ]; // Temporary placeholder

  return (
    <div>
      {data?.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
