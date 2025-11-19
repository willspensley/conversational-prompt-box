## Universal AI PDF Generator

This prototype was the prelude to the Verify Vision venture which gained market traction within the London property market. (https://verifyvision.co.uk/)

The reason I built this prior to Verify Vision was because almost immediately as I was building Verify Vision I realised that building out the full property management functionality was a larger task than was necessary for an MVP. The need for multiple pages and buttons quickly emerged, as producing a structured report for a property and its rooms would involve separate UI pages for entering property details, selecting rooms, and capturing photos for each section. The question surfaced of how streamlined the UI could be for users. A design similar to an AI chat interface appeared feasible, using a simple prompt box and an attachment upload button. This approach shaped the prototype developed seen here.


<img width="641" height="346" alt="image" src="https://github.com/user-attachments/assets/91593255-a0ea-4ee0-8016-f075d59191a2" />

After creating the prototype, I consulted potential customers in the construction industry to evaluate whether the MVP could effectively support daily reporting needs, such as snag lists and fire inspection reports, which are standard in the field. The goal was to develop a professional-grade PDF report generator for industries that handle bulk image uploads, where a single prompt could define the report style and provide relevant comments. However, a brief market test revealed significant challenges. Offering users excessive flexibility resulted in inconsistent and unreliable report outputs, highlighting the need for a balanced approach. This involved combining open-ended AI generation with a structured user interface and controlled AI inputs to ensure consistent, high-quality professional reports. This realisation became the guiding principle for the software’s development, focusing on tailored solutions with AI-driven automation for as many tasks as possible, while always prioritising accuracy. Accuracy mattered because if AI- generated reports or content were wrong or poorly structured any time-saving benefits would vanish if the final output was not up to standard. The commercial validation of the MVP indicated a need to revert to the core ideas initially set for testing. The focus turned to the importance of developing a complete property management system, incorporating separate UI pages for entering property details, selecting rooms, and taking photos for each section. This led to constructing the full UI functionality needed to produce a clear, usable PDF report suited to the property industry.

Please see Share-ai repo (Remaned to Verify Vision) for the final application software. Verify Vision later partnered with Londons largest property inventory manager (GreenKite).

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS




