import React from 'react';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import { AnatomySystem } from '../types/anatomy';

interface AnatomyCardProps {
  system: AnatomySystem;
  onClick: () => void;
  isStudied: boolean;
}

export const AnatomyCard: React.FC<AnatomyCardProps> = ({
  system,
  onClick,
  isStudied
}) => {
  

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={system.imageUrl}
          alt={system.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[system.difficulty]}`}>
            {system.difficulty}
          </span> */}
        </div>
        <div className="absolute top-3 right-3">
          {isStudied ? (
            <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
          ) : (
            <Star className="w-6 h-6 text-gray-400 hover:text-yellow-500 transition-colors" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {system.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {system.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {system.keyPoints.length} key points
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </div>
  );
};