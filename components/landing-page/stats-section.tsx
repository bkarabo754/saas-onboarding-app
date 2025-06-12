const StatsSection = () => {
  return (
    // Stats Section
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">9</div>
            <div className="text-blue-100">Companies onboarded</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">98%</div>
            <div className="text-blue-100">Setup completion rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">4.9★</div>
            <div className="text-blue-100">Average user rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
