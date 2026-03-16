import SignUpForm from "@/components/forms/auth/SignUpForm";

const page = () => {
    return <>
        <div className="grid min-h-svh">
            <div className="flex flex-col ">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full py-20 xl:max-w-2xl px-4 md:px-8">
                        <SignUpForm />
                    </div>
                </div>
            </div>
        </div>
    </>;
};

export default page;