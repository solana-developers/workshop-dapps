import { FC } from "react";
import { TweetObject } from "../models/types";


export const Tweet: FC<TweetObject> = (props: TweetObject) => {
    return(
        <div className="text-lg border-2 rounded-lg border-[#6e6e6e] px-6 py-2 mt-4 bg-[#1f1f1f]">
            <p className="text-[#a3a3a3]">
                {props.publicKey.toString()}
            </p>
            <p className="text-2xl my-2">
                <span className="text-[#29d688]">
                    {props.displayName}
                </span>
                <span className="ml-10 text-[#74a8fc]">
                    {props.handle}
                </span>
            </p>
            <p>
                {props.message}
            </p>
        </div>
    );
};
