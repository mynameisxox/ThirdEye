import React, { useState, useEffect } from "react";

export default function Header() {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const timeString = time.toLocaleTimeString();

    return (
        <header className="absolute top-0 right-0 py-2 px-10 w-full z-50 select-none">
            <div className="max-w-6xl flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2 
                tracking-widest uppercase
                  text-accent bg-accent/20
                  px-3 py-1 rounded font-semibold border border-accent/30 w-[280px] justify-center text-xl">

                    <span className="">
                        THIRD-EYE -
                    </span>

                    <span className=" text-white/80">
                        {timeString}
                    </span>

                </div>
            </div>
        </header>
    );
}