'use client';

const stats = [
  {
    value: '5',
    label: 'Companies onboarded',
    description: 'Trusted by businesses worldwide',
  },
  {
    value: '98%',
    label: 'Setup completion rate',
    description: 'Users successfully complete their onboarding',
  },
  {
    value: '4.9★',
    label: 'Average user rating',
    description: 'Highly rated by our satisfied customers',
  },
];

export function StatsSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Join thousands of companies that have transformed their onboarding
            experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
                {stat.value}
              </div>
              <div className="text-blue-100 font-medium mb-2">{stat.label}</div>
              <div className="text-blue-200 text-sm opacity-90">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
