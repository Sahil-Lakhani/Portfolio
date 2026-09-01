import { motion } from 'framer-motion'
// import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import heroImg from '../../../assets/ChatGPT Image May 7, 2026, 11_37_19 PM.png'
import styles from './HeroMap.module.css'

const ease = [0.16, 1, 0.3, 1]
// const MUNICH = [48.1351, 11.582]

export default function HeroMap({ anim, className }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={anim}
      variants={{
        hidden:  { opacity: 0, scale: 0.97 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease, delay: 0.3 } },
      }}
    >
      <span className={styles.cellLabel}>MUNICH · UTC+1</span>
      <div className={styles.imgInner} style={{ backgroundImage: `url(${heroImg})` }} />
      {/* <div className={styles.mapInner} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
        <MapContainer
          center={MUNICH}
          zoom={11}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          doubleClickZoom={false}
          keyboard={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <CircleMarker
            center={MUNICH}
            radius={6}
            pathOptions={{ color: '#ff3c00', fillColor: '#ff3c00', fillOpacity: 1 }}
          />
        </MapContainer>
      </div> */}
    </motion.div>
  )
}
