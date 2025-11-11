import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "../ui/button";

export function MainNav() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'user-avatar');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-primary">
              <path d="M228,80v96a12,12,0,0,1-12,12H40a12,12,0,0,1-12-12V80A12,12,0,0,1,40,68H216A12,12,0,0,1,228,80Zm-24,0H52V176H204ZM128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
            </svg>
            <span className="inline-block font-bold font-headline text-lg">Fluxion</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild>
              <Link href="#">Docs</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#">Settings</Link>
            </Button>
            <Avatar className="h-9 w-9">
              {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt="User Avatar" data-ai-hint={avatarImage.imageHint} />}
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </div>
    </header>
  );
}
