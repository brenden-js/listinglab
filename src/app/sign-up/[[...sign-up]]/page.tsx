import {auth, SignUp} from "@clerk/nextjs";
import {redirect} from "next/navigation";

export default function Page() {
  const user = auth()
  if (user.userId) {
    return redirect('/dashboard')
  }
  return (
    <div className="flex justify-center py-24">
      <SignUp />
    </div>
  );
}
