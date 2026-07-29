function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "לילה טוב";
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}

export function Greeting({ name = "דפנה" }: { name?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
        {getGreetingPrefix()} {name}, בואי נראה כמה באמת נשאר לך החודש
      </h1>
    </div>
  );
}
