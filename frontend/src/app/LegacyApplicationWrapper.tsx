export default function LegacyApplication({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="sr-legacy-application">{children}</div>;
}
