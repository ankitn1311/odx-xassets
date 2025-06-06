import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    id: 1,
    title: 'How can I get involved?',
    description:
      'ODX Ascension will run over the course of ~1.5 months. Users can participate by Trading, Staking & Utilizing boosts (See perks).',
  },
  {
    id: 2,
    title: 'How can I accrue points?',
    description:
      'Simple. Trade Frequency, Trade Volume, Staking & Utilizing boosts. Participants can monitor their points via leaderboards. Snapshot will be taken after ODX Ascension ends.',
  },
  {
    id: 3,
    title: 'What Are xAssets?',
    description:
      "xAssets represent the cornerstone of ODX's vision to unify fragmented blockchain liquidity. Each xAsset is a 1:1 pegged representation of a native asset from its original blockchain, now available for seamless use within the Sonic ecosystem.",
  },
  {
    id: 4,
    title: 'How does ODX work?',
    description:
      'ODX currently operates as a federated PoA (Proof-of-Authority) network, prioritizing fast execution and reliability while ensuring xAssets remain fully secured. Turnkey is fully non-custodial, meaning that your users are always in control of their wallets.',
  },
];

const FAQs = () => {
  return (
    <div className="font-poppins pt-6">
      <h2 className="text-center text-3xl font-medium">FAQs</h2>
      <Accordion type="single" collapsible className="">
        {faqs.map(faq => (
          <AccordionItem value={faq.title} key={faq.id}>
            <AccordionTrigger className="px-2 text-left lg:px-6">{faq.title}</AccordionTrigger>
            <AccordionContent className="px-2 lg:px-6">{faq.description}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQs;
