<div style={box}>
  <h4>Friends</h4>

  {friends.length === 0 ? (
    <p>No friends yet</p>
  ) : (
    friends.map((f, i) => (
      <div key={i}>
        <p>{f.email} — 🔥 {f.streak || 0}</p>

        <button
          style={btn("#22c55e")}
          onClick={() => (window.location.href = "/chat/" + f.id)}
        >
          Message 💬
        </button>
      </div>
    ))
  )}
</div>