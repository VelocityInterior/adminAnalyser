const PageContainer = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-zinc-950 text-zinc-100  ${className}`}>
      <div className="max-w-full">{children}</div>
    </div>
  );
};

export default PageContainer;
