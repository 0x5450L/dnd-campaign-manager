import { useState } from "react";
import CommonButton from "../../ui/buttons/CommonButton";
import CommonInput from "../../ui/inputs/CommonInput";

export default function CreateInvite() {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200">Invite to campaign</h2>

      <div className="flex flex-col gap-2">
        <CommonInput
          type="email"
          name="email"
          placeholder="Email"
          variant="boxed"
          value={email}
          onChange={(value) => setEmail(value)}
          validator={(value) => {
            if (!value) {
              return { errorMessage: "Email is required", validatedValue: value };
            }
            if (!value.includes("@")) {
              return { errorMessage: "Invalid email", validatedValue: value };
            }
            return { errorMessage: null, validatedValue: value };
          }}
        />
        <div className="flex gap-2 justify-end">
          <CommonButton className="w-fit" variant="accept">
            Send invite
          </CommonButton>
          <CommonButton className="w-fit">Copy invite link</CommonButton>
        </div>
      </div>
    </div>
  );
}
