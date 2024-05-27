import Image from 'next/image'

import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'Do I need to credit or attribute text generations?',
      answer:
        'No, generations are yours 100% and you can use them without attribution.',
    },
    {
      question: 'Are text generations saved?',
      answer: 'Absolutely, your generations are easily accessible and stored until you delete them.',
    },
    {
      question: 'Am I unknowingly training some AI model?',
      answer:
        'Your text generations are not and will not be used to train an AI model.',
    },
  ],
  [
    {
      question: 'Who is this product for?',
      answer:
        'This product is being designed for real estate agents to help them better serve clients.',
    },
    {
      question:
        'Do you have support for teams?',
      answer:
        'We currently do not have support for team, if this is a feature you would like contact us.',
    },
    {
      question:
        'Do you have an affiliate program?',
      answer:
        'We currently do not have an affiliate program. If this is something you are interested, in contact us.',
    },
  ],
  [
    {
      question: 'What happens if I use my allocation?',
      answer:
        'You will still be able to access all your generations, and you can wait until your membership renews, or upgrade to the next tier.',
    },
    {
      question: 'How can I check my usage?',
      answer: 'Click the Subscriptions tab in the dashboard, and you can check you your current usage and quotas.',
    },
    {
      question: 'How do I pause or cancel a subscription?',
      answer:
        'Not for you? No worries, click the Subscriptions tab in the dashboard, and then click "Manage Subscription" to cancel or upgrade with our payment partner Stripe.',
    },
  ],
]

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute top-0 left-1/2 max-w-none translate-x-[-30%] -translate-y-1/4"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-slate-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-slate-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
