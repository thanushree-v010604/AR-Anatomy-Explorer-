import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Lightbulb, Link } from 'lucide-react';
import { AnatomyAI } from './AnatomyAI';
import { AnatomySystem } from '../types/anatomy';
import DownloadButton from './DownloadButton.jsx';

interface AnatomyDetailProps {
  system: AnatomySystem;
  onBack: () => void;
}

export const AnatomyDetail: React.FC<AnatomyDetailProps> = ({
  system,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'facts' | 'related'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'facts', label: 'Fun Facts', icon: Lightbulb },
    { id: 'related', label: 'Related Systems', icon: Link }
  ] as const;

  




  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Systems</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative h-64 md:h-96">
          <img
            src={system.imageUrl}
            alt={system.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {system.name}
                </h1>
                <p className="text-white/90 text-lg max-w-2xl">
                  {system.description}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {/* <div className={`${difficultyColors[system.difficulty]} px-3 py-1 rounded-full text-white text-sm font-medium`}>
                  {system.difficulty}
                </div> */}
                {/* <button className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors">
                  <Share2 className="w-5 h-5 text-white" onClick={() => window.location.href = system.threedmodel} />
                </button> */}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <span className="text-green-500 font-semibold" onClick={() => window.location.href = system.threedmodel}> VIEW LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${activeTab === id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Information</h3>
                <div className="grid gap-4">
                  {system.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'facts' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fascinating Facts</h3>
                <div className="grid gap-4">
                  {system.funFacts.map((fact, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                    >
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-800 font-medium text-lg">{fact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DownloadButton fileName={system.htmlnotesName} />

            {/* Anatomy AI panel (mock in Phase 3) */}
            <AnatomyAI system={system} />

            {activeTab === 'related' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Related Systems</h3>
                <div className="grid gap-4">
                  {system.relatedSystems.map((relatedId, index) => (
                    <div
                      key={index}
                      className="p-4 bg-teal-50 rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <Link className="w-5 h-5 text-teal-600" />
                        <span className="text-gray-800 font-medium capitalize">
                          {relatedId.replace(/([A-Z])/g, ' $1')} System
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};