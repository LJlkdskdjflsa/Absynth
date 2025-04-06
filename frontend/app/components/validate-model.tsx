'use client';

import React, { useState, useEffect } from 'react';
import SelfQRcodeWrapper, { countries, SelfApp, SelfAppBuilder } from '@selfxyz/qrcode';
import { v4 as uuidv4 } from 'uuid';

interface ValidateModelProps {
    onSuccess: () => void;
}

function ValidateModel({ onSuccess }: ValidateModelProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [savingOptions, setSavingOptions] = useState(false);

    useEffect(() => {
        setUserId(uuidv4());
    }, []);

    const [disclosures, setDisclosures] = useState({
        // DG1 disclosures
        issuing_state: false,
        name: false,
        nationality: true,
        date_of_birth: true,
        passport_number: false,
        gender: false,
        expiry_date: false,
        // Custom checks
        minimumAge: 20,
        excludedCountries: [
            countries.IRAN,
            countries.IRAQ,
            countries.NORTH_KOREA,
            countries.RUSSIA,
            countries.SYRIAN_ARAB_REPUBLIC,
            countries.VENEZUELA
        ],
        ofac: true,
    });

    const [showCountryModal, setShowCountryModal] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([
        countries.IRAN,
        countries.IRAQ,
        countries.NORTH_KOREA,
        countries.RUSSIA,
        countries.SYRIAN_ARAB_REPUBLIC,
        countries.VENEZUELA
    ]);

    const [countrySelectionError, setCountrySelectionError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');





    const saveOptionsToServer = async () => {
        if (!userId || savingOptions) return;

        setSavingOptions(true);
        try {
            const response = await fetch('/api/saveOptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    options: {
                        minimumAge: disclosures.minimumAge > 0 ? disclosures.minimumAge : undefined,
                        excludedCountries: disclosures.excludedCountries,
                        ofac: disclosures.ofac,
                        issuing_state: disclosures.issuing_state,
                        name: disclosures.name,
                        nationality: disclosures.nationality,
                        date_of_birth: disclosures.date_of_birth,
                        passport_number: disclosures.passport_number,
                        gender: disclosures.gender,
                        expiry_date: disclosures.expiry_date
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save options');
            }
        } catch (error) {
            console.error('Error saving options:', error);
            // Only show alert if it's a user-facing error
            if (error instanceof Error && error.message) {
                alert(error.message);
            } else {
                alert('Failed to save verification options. Please try again.');
            }
        } finally {
            setSavingOptions(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (userId) {
                saveOptionsToServer();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [disclosures, userId]);

    if (!userId) return null;

    const selfApp = new SelfAppBuilder({
        appName: "Self Playground",
        scope: "self-playground",
        endpoint: "https://playground.self.xyz/api/verify",
        // endpoint: "https://bobcat-saved-rooster.ngrok-free.app",
        endpointType: "https",
        logoBase64: "https://i.imgur.com/Rz8B3s7.png",
        userId,
        disclosures: {
            ...disclosures,
            minimumAge: disclosures.minimumAge > 0 ? disclosures.minimumAge : undefined,
        },
        devMode: false,
    } as Partial<SelfApp>).build();

    console.log("selfApp in:", selfApp);


    return (

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                    <SelfQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={() => {
                            console.log('Verification successful');
                            onSuccess();
                        }}
                        darkMode={false}
                    />
                </div>
            </div>
        </div>

    );
}

export default ValidateModel;
