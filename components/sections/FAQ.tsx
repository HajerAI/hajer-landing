import { faq } from "@/content/copy";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section id="faq" className="section-anchor border-b border-hairline bg-carbon py-20 md:py-28">
      <div className="shell max-w-3xl mx-auto">
        <div>
          <h2 className="text-3xl font-medium tracking-[-0.03em] text-white text-balance md:text-5xl">
            {faq.headline}
          </h2>
        </div>

        <div>
          <div className="mt-16">
            <Accordion type="multiple" className="w-full">
              {faq.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-hairline">
                  <AccordionTrigger className="py-6 text-left text-base font-medium text-white hover:text-vermilion hover:no-underline md:text-lg">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted text-base leading-relaxed pb-6">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
