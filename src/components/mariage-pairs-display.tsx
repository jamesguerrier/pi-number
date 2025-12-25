interface MariagePairsDisplayProps {
    mariagePairs: string[];
}

export function MariagePairsDisplay({ mariagePairs }: MariagePairsDisplayProps) {
    if (mariagePairs.length === 0) return null;

    return (
        <div className="space-y-2">
            <h4 className="font-semibold text-lg text-orange-600 dark:text-orange-400">Mariage Pairs</h4>
            <div className="flex flex-wrap gap-2">
                {mariagePairs.map((pair, index) => (
                    <span 
                        key={index} 
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full font-mono"
                    >
                        {pair}
                    </span>
                ))}
            </div>
        </div>
    );
}