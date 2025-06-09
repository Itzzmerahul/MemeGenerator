import { useEffect, useState, useRef } from "react"
import Group from "../Images/Group.png"


export default function Main() {
  const [meme, setMeme] = useState({
    topText: "One does not simply",
    bottomText: "Walk into Mordor",
    imageUrl: Group
  })

  const [memeimg, setMemeimg] = useState([])
  const [gallery, setGallery] = useState([])
  const [selectedMeme, setSelectedMeme] = useState(null)
  const [zoomedMeme, setZoomedMeme] = useState(null)
  const [multiSelectMode, setMultiSelectMode] = useState(false)
  const [multiSelectedMemes, setMultiSelectedMemes] = useState([])
  const canvasRef = useRef(null)

  useEffect(() => {
    fetch("https://api.imgflip.com/get_memes")
      .then(res => res.json())
      .then(data => setMemeimg(data.data.memes))
  }, [])

  function handleFunc(event) {
    const { value, name } = event.currentTarget
    setMeme(prev => ({ ...prev, [name]: value }))
  }

  function getMemeImage() {
    const rand = Math.floor(Math.random() * memeimg.length)
    const newimg = memeimg[rand].url
    setMeme(prev => ({ ...prev, imageUrl: newimg }))
  }

  function downloadMeme() {
    generateMemeImage((dataUrl) => {
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = "meme.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  function generateMemeImage(callback) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = meme.imageUrl

    image.onload = () => {
      canvas.width = image.width
      canvas.height = image.height
      ctx.drawImage(image, 0, 0)

      ctx.fillStyle = "black"
      ctx.textAlign = "center"
      ctx.font = `${Math.floor(canvas.height / 15)}px 'Segoe UI', sans-serif`
      ctx.textBaseline = "top"
      ctx.fillText(meme.topText, canvas.width / 2, 10)
      ctx.textBaseline = "bottom"
      ctx.fillText(meme.bottomText, canvas.width / 2, canvas.height - 10)

      const dataUrl = canvas.toDataURL("image/png")
      callback(dataUrl)
    }
  }

  function addToGallery() {
    generateMemeImage((dataUrl) => {
      setGallery(prev => [...prev, { id: Date.now(), imageUrl: dataUrl }])
    })
  }

  function removeFromGallery() {
    if (multiSelectMode) {
      setGallery(prev => prev.filter(item => !multiSelectedMemes.some(m => m.id === item.id)))
      setMultiSelectedMemes([])
    } else {
      if (!selectedMeme) return
      setGallery(prev => prev.filter(item => item.id !== selectedMeme.id))
      setSelectedMeme(null)
    }
  }

  function handleGalleryClick(item) {
    if (multiSelectMode) {
      setMultiSelectedMemes(prev =>
        prev.some(m => m.id === item.id)
          ? prev.filter(m => m.id !== item.id)
          : [...prev, item]
      )
    } else {
      setSelectedMeme(item)
    }
  }

  function handleGalleryDoubleClick(item) {
    setZoomedMeme(item)
  }

  function closeZoom() {
    setZoomedMeme(null)
  }

  function downloadFromGallery() {
    if (multiSelectMode && multiSelectedMemes.length > 0) {
      multiSelectedMemes.forEach((item, index) => {
        const link = document.createElement("a")
        link.href = item.imageUrl
        link.download = `meme-${index + 1}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    } else if (selectedMeme) {
      const link = document.createElement("a")
      link.href = selectedMeme.imageUrl
      link.download = "meme.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <main className="main-container">
      <div className="form">
        <h1 className="title">🎨 Generate Your Meme Here!</h1>
        <label>
          Top Text
          <input
            type="text"
            placeholder="One does not simply"
            name="topText"
            onChange={handleFunc}
            value={meme.topText}
          />
        </label>

        <label>
          Bottom Text
          <input
            type="text"
            placeholder="Walk into Mordor"
            name="bottomText"
            onChange={handleFunc}
            value={meme.bottomText}
          />
        </label>

        <div className="button-group">
          <button onClick={getMemeImage}>🎲 New Meme</button>
          <button onClick={downloadMeme}>⬇️ Download</button>
          <button onClick={addToGallery}>➕ Add to Gallery</button>
          <button onClick={removeFromGallery}>❌ Remove from Gallery</button>
        </div>
      </div>

      <div className="meme-preview">
        <div className="meme">
          <img src={meme.imageUrl} alt="Meme" />
          <span className="top-text">{meme.topText}</span>
          <span className="bottom-text">{meme.bottomText}</span>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {gallery.length > 0 && (
        <div className="gallery-section">
          <div className="gallery">
            <h2>Your Meme Gallery</h2>
            <div className="gallery-images">
              {gallery.map((item) => {
                const isSelected = multiSelectMode
                  ? multiSelectedMemes.some(m => m.id === item.id)
                  : selectedMeme?.id === item.id
                return (
                  <img
                    key={item.id}
                    src={item.imageUrl}
                    alt="Saved Meme"
                    className={isSelected ? "gallery-img selected" : "gallery-img"}
                    onClick={() => handleGalleryClick(item)}
                    onDoubleClick={() => handleGalleryDoubleClick(item)}
                  />
                )
              })}
            </div>
          </div>

          <div className="gallery-controls">
            <label>
              <input
                type="checkbox"
                checked={multiSelectMode}
                onChange={() => {
                  setMultiSelectMode(prev => !prev)
                  setMultiSelectedMemes([])
                }}
              /> Multi-Select Mode
            </label>
            <button onClick={downloadFromGallery}>⬇️ Download from Gallery</button>
          </div>
        </div>
      )}

      {zoomedMeme && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <img
            src={zoomedMeme.imageUrl}
            alt="Zoomed Meme"
            className="zoomed-img"
          />
        </div>
      )}
    </main>
  )
}
