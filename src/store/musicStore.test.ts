import { describe, it, expect, beforeEach } from 'vitest';
import { useMusicStore, STATIONS } from './musicStore';

describe('musicStore', () => {
    beforeEach(() => {
        useMusicStore.setState({
            isPlaying: false,
            volume: 50,
            savedVolume: null,
            currentStationId: STATIONS[0].id,
            isMuted: false,
            isPlayerOpen: false,
        });
    });

    it('initializes with a valid station from STATIONS', () => {
        const state = useMusicStore.getState();
        const found = STATIONS.find(s => s.id === state.currentStationId);
        expect(found).toBeDefined();
        expect(found?.id).toBe('lofi-radio');
    });

    it('toggles play state', () => {
        expect(useMusicStore.getState().isPlaying).toBe(false);
        useMusicStore.getState().togglePlay();
        expect(useMusicStore.getState().isPlaying).toBe(true);
        useMusicStore.getState().togglePlay();
        expect(useMusicStore.getState().isPlaying).toBe(false);
    });

    it('cycles stations with nextStation and previousStation', () => {
        useMusicStore.getState().setStation(STATIONS[0].id);
        expect(useMusicStore.getState().currentStationId).toBe(STATIONS[0].id);

        useMusicStore.getState().nextStation();
        expect(useMusicStore.getState().currentStationId).toBe(STATIONS[1].id);
        expect(useMusicStore.getState().isPlaying).toBe(true);

        useMusicStore.getState().previousStation();
        expect(useMusicStore.getState().currentStationId).toBe(STATIONS[0].id);

        // Previous wraps to last station
        useMusicStore.getState().previousStation();
        expect(useMusicStore.getState().currentStationId).toBe(STATIONS[STATIONS.length - 1].id);
    });

    it('handles setting invalid station by falling back to default', () => {
        useMusicStore.getState().setStation('invalid-station-id');
        expect(useMusicStore.getState().currentStationId).toBe(STATIONS[0].id);
    });

    it('ducks volume during alarm and restores it', () => {
        useMusicStore.setState({ isPlaying: true, volume: 80 });

        useMusicStore.getState().duckVolume();
        expect(useMusicStore.getState().volume).toBe(5);
        expect(useMusicStore.getState().savedVolume).toBe(80);

        // Calling duck again while already ducked should not overwrite savedVolume
        useMusicStore.getState().duckVolume();
        expect(useMusicStore.getState().savedVolume).toBe(80);

        useMusicStore.getState().restoreVolume();
        expect(useMusicStore.getState().volume).toBe(80);
        expect(useMusicStore.getState().savedVolume).toBeNull();
    });

    it('toggles mute correctly', () => {
        expect(useMusicStore.getState().isMuted).toBe(false);
        useMusicStore.getState().toggleMute();
        expect(useMusicStore.getState().isMuted).toBe(true);
    });
});
