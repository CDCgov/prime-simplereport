const Link = ({ email = "", name = "" }) => (
  <li>
    <a
      className="ghost-user-link"
      href={`/#access_token=SR-DEMO-LOGIN%20${email}`}
    >
      Login as {name}
    </a>
  </li>
);

const ChangeUser = () => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <>
      <Link email="jamar@example.com" name="Jamar (Entry Only)" />
      <Link email="ruby@example.com" name="Ruby (Basic User)" />
      <Link email="sarah@example.com" name="Sarah (Admin)" />
      <Link email="bob@example.com" name="Bob (Support Admin)" />
    </>
  );
};

export default ChangeUser;
