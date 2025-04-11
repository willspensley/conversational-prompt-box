
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { WordFadeIn } from "@/components/ui/word-fade-in";

export function ReportDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <WordFadeIn 
            words="create professional reports for any industry" 
            delay={0.3}
            className="text-2xl md:text-4xl text-center font-bold text-primary mb-2"
          />
        }
      >
        <img
          src="/lovable-uploads/981be668-6af9-4569-9aa9-e98d2b8caad9.png"
          alt="Professional report example"
          className="mx-auto rounded-2xl object-cover h-full w-full"
          draggable={false}
        />
      </ContainerScroll>
    </div>
  );
}
