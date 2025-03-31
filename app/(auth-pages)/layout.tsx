export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center items-center w-full h-full min-h-[calc(100vh-63.2px)]">{children}</div>
  );
}
