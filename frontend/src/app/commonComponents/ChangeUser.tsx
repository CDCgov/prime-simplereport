const ChangeUser = () => {
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  const getLink = (email: string, name: string) => (
    <a
      className="ghost-user-link"
      href={`/#access_token=SR-DEMO-LOGIN%20${email}`}
    >
      Login as {name}
    </a>
  );

  return (
    <>
      {getLink("jamar@example.com", "Jamar (Entry Only)")}
      {getLink("ruby@example.com", "Ruby (Basic User)")}
      {getLink("sarah@example.com", "Sarah (Admin)")}
      {getLink("bob@example.com", "Bob (Support Admin)")}
    </>
  );
};

export default ChangeUser;
