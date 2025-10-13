
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { KeyIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from './icons';

interface KeyPanelProps {
    onValidate: (key: string) => void;
    status: 'idle' | 'validating' | 'valid' | 'invalid';
    activeKeyTail: string;
}

export const KeyPanel: React.FC<KeyPanelProps> = ({ onValidate, status, activeKeyTail }) => {
    const [key, setKey] = useState('');

    const getStatusIndicator = () => {
        switch (status) {
            case 'validating':
                return <LoaderIcon className="w-5 h-5 text-indigo-400 animate-spin" />;
            case 'valid':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'invalid':
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            default:
                return null;
        }
    };
    
    return (
        <div className="space-y-3 p-3 bg-gray-800/50 rounded-lg">
            <h2 className="text-sm font-semibold text-gray-300">API Key</h2>
            <div className="flex items-center space-x-2">
                <Input
                    type="password"
                    placeholder="Enter your API key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    icon={<KeyIcon className="w-4 h-4 text-gray-500" />}
                    disabled={status === 'validating'}
                />
                <Button 
                    onClick={() => onValidate(key)}
                    disabled={!key || status === 'validating'}
                    className="w-32"
                >
                    {status === 'validating' ? 'Validating...' : 'Validate Key'}
                </Button>
            </div>
            {status !== 'idle' && (
                <div className="flex items-center space-x-2 text-xs h-5">
                    {getStatusIndicator()}
                    {status === 'valid' && <p className="text-green-400">Key is valid. Active Key: ****{activeKeyTail}</p>}
                    {status === 'invalid' && <p className="text-red-400">Key is invalid. Please check and try again.</p>}
                </div>
            )}
        </div>
    );
};
