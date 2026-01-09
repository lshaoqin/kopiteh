import { CardHolder } from "./cardholder";
import { useRouter } from "next/navigation";

function DisplayGrid({
  items,
  variant,
  href,
}: {
  items: {
    id: string;
    name: string;
    img?: string;
    isActive?: boolean; // only for stalls
  }[];
  variant: "venue" | "stall";
  href?: (id: string) => string;
}) {
  const router = useRouter();

  return (
    <div className="flex justify-center text-left mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
      {items.map((item) => {
        const clickable = !!href;
        return (
          <div 
            key={item.id}
            onClick={clickable ? () => router.push(href(item.id)) : undefined}
            className={`text-left cursor-pointer`}>
              <CardHolder
                name={item.name}
                img={item.img}
                variant={variant}
                isActive={item.isActive}
              />
          </div>
        );
      })}
    </div>
  );
}

export { DisplayGrid };
